import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Recursively convert Date objects to YYYY-MM-DD strings
 * to avoid timezone issues on the frontend
 */
function normalizeDates(obj: any): any {
  if (obj instanceof Date) {
    // Convert Date to YYYY-MM-DD string (local date)
    const year = obj.getFullYear();
    const month = String(obj.getMonth() + 1).padStart(2, '0');
    const day = String(obj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
