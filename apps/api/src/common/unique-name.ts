import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export async function withUniqueName<T>(
  run: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }
    throw e;
  }
}
