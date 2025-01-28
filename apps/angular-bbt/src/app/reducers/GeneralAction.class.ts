import { TypedAction } from '@ngrx/store/src/models';

export class GeneralAction<T extends string, P = never>
  implements TypedAction<T>
{
  constructor(public readonly type: T, public payload: P = null) {}
}
