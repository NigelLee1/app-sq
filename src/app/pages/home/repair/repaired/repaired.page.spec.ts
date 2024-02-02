import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RepairedPage } from './repaired.page';

describe('RepairedPage', () => {
  let component: RepairedPage;
  let fixture: ComponentFixture<RepairedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepairedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RepairedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
