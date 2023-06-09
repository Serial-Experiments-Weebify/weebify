import { Length, Matches } from 'class-validator';

export class CreateV0 {
    @Length(3, 120)
    @Matches(/^[a-z0-9\-]+$/i)
    job: string;
}
