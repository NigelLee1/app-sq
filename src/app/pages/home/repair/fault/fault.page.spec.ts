import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FaultPage } from './fault.page';

describe('FaultPage', () => {
  let component: FaultPage;
  let fixture: ComponentFixture<FaultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaultPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FaultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
