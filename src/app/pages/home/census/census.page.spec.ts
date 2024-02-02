import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CensusPage } from './census.page';

describe('CensusPage', () => {
  let component: CensusPage;
  let fixture: ComponentFixture<CensusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CensusPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CensusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
