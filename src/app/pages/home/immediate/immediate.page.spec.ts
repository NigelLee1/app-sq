import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImmediatePage } from './immediate.page';

describe('ImmediatePage', () => {
  let component: ImmediatePage;
  let fixture: ComponentFixture<ImmediatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmediatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImmediatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
