import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumSubscription } from './premium-subscription';

describe('PremiumSubscription', () => {
  let component: PremiumSubscription;
  let fixture: ComponentFixture<PremiumSubscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumSubscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumSubscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
