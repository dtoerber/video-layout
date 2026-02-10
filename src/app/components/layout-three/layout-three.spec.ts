import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutThree } from './layout-three';

describe('LayoutThree', () => {
  let component: LayoutThree;
  let fixture: ComponentFixture<LayoutThree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutThree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutThree);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
