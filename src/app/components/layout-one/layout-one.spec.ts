import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutOne } from './layout-one';

describe('LayoutOne', () => {
  let component: LayoutOne;
  let fixture: ComponentFixture<LayoutOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutOne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
