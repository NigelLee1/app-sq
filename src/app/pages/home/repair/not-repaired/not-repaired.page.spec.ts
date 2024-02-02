import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotRepairedPage } from './not-repaired.page';

describe('NotRepairedPage', () => {
  let component: NotRepairedPage;
  let fixture: ComponentFixture<NotRepairedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotRepairedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotRepairedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
