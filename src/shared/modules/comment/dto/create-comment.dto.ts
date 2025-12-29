import { IsNumber, IsString, Length, Max, Min, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'text is required' })
  @Length(5, 1024, { message: 'text length must be between 5 and 1024 characters' })
  public text: string;

  @IsNumber({}, { message: 'rating must be a number' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  public rating!: number;
  
  @IsOptional()
  @IsString({ message: 'offerId must be a string' })
  public offerId?: string;

  @IsOptional()
  @IsString({ message: 'userId must be a string' })
  public userId?: string;
}
