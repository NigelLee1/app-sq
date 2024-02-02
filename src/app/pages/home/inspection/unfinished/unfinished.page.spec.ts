import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UnfinishedPage } from './unfinished.page';

describe('UnfinishedPage', () => {
  let component: UnfinishedPage;
  let fixture: ComponentFixture<UnfinishedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnfinishedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnfinishedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
