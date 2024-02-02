import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RepairDetailPage } from './repair-detail.page';

describe('RepairDetailPage', () => {
  let component: RepairDetailPage;
  let fixture: ComponentFixture<RepairDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepairDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RepairDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
