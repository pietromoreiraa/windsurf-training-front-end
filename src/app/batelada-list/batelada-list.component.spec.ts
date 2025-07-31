import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BateladaListComponent } from './batelada-list.component';

describe('BateladaListComponent', () => {
  let component: BateladaListComponent;
  let fixture: ComponentFixture<BateladaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BateladaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BateladaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
