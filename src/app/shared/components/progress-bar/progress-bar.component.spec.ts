import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
  });

  it('should calculate 50% correctly', () => {
    fixture.componentRef.setInput('current', 500);
    fixture.componentRef.setInput('target', 1000);
    fixture.detectChanges();

    expect(component.percentage()).toBe(50);
    expect(component.isCompleted()).toBe(false);
  });

  it('should cap at 100% when goal is reached or exceeded', () => {
    fixture.componentRef.setInput('current', 1200);
    fixture.componentRef.setInput('target', 1000);
    fixture.detectChanges();

    expect(component.percentage()).toBe(100);
    expect(component.isCompleted()).toBe(true);
  });
});

