import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RepairPage } from './repair.page';

describe('RepairPage', () => {
  let component: RepairPage;
  let fixture: ComponentFixture<RepairPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepairPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RepairPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
