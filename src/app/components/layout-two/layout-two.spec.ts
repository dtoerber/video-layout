import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutTwo } from './layout-two';

describe('LayoutTwo', () => {
  let component: LayoutTwo;
  let fixture: ComponentFixture<LayoutTwo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutTwo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutTwo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
