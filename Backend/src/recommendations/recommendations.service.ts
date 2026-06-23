import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { QueryRecommendationDto } from './dto/query-recommendation.dto';

interface RecommendationRow {
  id: number;
  user_id: number;
  advisor_id: number | null;
  text: string;
  created_at: Date;
}

const mapRec = (row: RecommendationRow) => ({
  id: row.id,
  userId: row.user_id,
  advisorId: row.advisor_id,
  text: row.text,
  createdAt: row.created_at,
});

@Injectable()
export class RecommendationsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser, query: QueryRecommendationDto) {
    let ownerId = user.userId;
    if (user.role === 'advisor' && query.userId) {
      ownerId = Number(query.userId);
    }

    let sql = 'SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC';
    const params: unknown[] = [ownerId];

    if (query.limit) {
      sql += ' LIMIT $2';
      params.push(Number(query.limit));
    }

    const { rows } = await this.db.query<RecommendationRow>(sql, params);
    return rows.map(mapRec);
  }

  async create(advisor: AuthUser, dto: CreateRecommendationDto) {
    if (String(dto.text).trim().length < 10) {
      throw new BadRequestException('La recomendacion debe tener al menos 10 caracteres.');
    }

    const { rows: userRows } = await this.db.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'user'",
      [Number(dto.userId)],
    );
    if (userRows.length === 0) {
      throw new NotFoundException('Usuario destino no encontrado.');
    }

    const { rows } = await this.db.query<RecommendationRow>(
      'INSERT INTO recommendations (user_id, advisor_id, text) VALUES ($1, $2, $3) RETURNING *',
      [Number(dto.userId), advisor.userId, String(dto.text).trim()],
    );

    return mapRec(rows[0]);
  }
}
