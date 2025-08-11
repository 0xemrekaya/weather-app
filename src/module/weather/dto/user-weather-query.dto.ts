import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
    asc = 'asc',
    desc = 'desc'
}

export enum SortBy {
    queryTime = 'queryTime',
    city = 'city'
}

export class UserWeatherQueryParams {
    @ApiPropertyOptional({
        description: 'Page number (1-based)',
        minimum: 1,
        default: 1,
        example: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 20,
        example: 20
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        enum: SortBy,
        default: SortBy.queryTime,
        example: SortBy.queryTime
    })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.queryTime;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        default: SortOrder.desc,
        example: SortOrder.desc
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.desc;

    @ApiPropertyOptional({
        description: 'Filter by city (partial match)',
        example: 'Istanbul'
    })
    @IsOptional()
    city?: string;
}
