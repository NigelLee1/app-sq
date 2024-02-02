import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChoosePage } from './choose.page';

describe('ChoosePage', () => {
  let component: ChoosePage;
  let fixture: ComponentFixture<ChoosePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChoosePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChoosePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
