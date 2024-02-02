import { TestBed } from '@angular/core/testing';

import { MapToolService } from './map-tool.service';

describe('MapToolService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapToolService = TestBed.get(MapToolService);
    expect(service).toBeTruthy();
  });
});
