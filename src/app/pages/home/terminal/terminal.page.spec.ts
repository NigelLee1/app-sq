import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TerminalPage } from './terminal.page';

describe('TerminalPage', () => {
  let component: TerminalPage;
  let fixture: ComponentFixture<TerminalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TerminalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
