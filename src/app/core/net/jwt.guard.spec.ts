import { TestBed, inject } from '@angular/core/testing';

import { JWTGuard } from './jwt.guard';

describe('JwtGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JWTGuard]
    });
  });

  it('should ...', inject([JWTGuard], (guard: JWTGuard) => {
    expect(guard).toBeTruthy();
  }));
});
