import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMediaInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
