import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { dateToLocalString } from '../utils/date.utils';

/**
 * Recursively convert Date objects to YYYY-MM-DD strings
 * using always America/Asuncion (UTC-3) to avoid timezone drift.
 */
function normalizeDates(obj: any): any {
  if (obj instanceof Date) {
    return dateToLocalString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeDates);
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = normalizeDates(obj[key]);
    }
    return result;
  }
  return obj;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { data: T }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T }> {
    return next.handle().pipe(
      map((data) => {
        // If already wrapped, pass through
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }
        // Normalize all dates in the response
        const normalized = normalizeDates(data);
        return { data: normalized };
      }),
    );
  }
}
