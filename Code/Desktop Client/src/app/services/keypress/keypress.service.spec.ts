import { TestBed } from '@angular/core/testing';
import {
  ABOVE_ANGLE_LIMIT, ABOVE_LENGTH_LIMIT,
  ABOVE_ROTATION_LIMIT, BELOW_ANGLE_LIMIT, BELOW_DIAMETER_LIMIT, BELOW_LENGTH_LIMIT, BELOW_ROTATION_LIMIT,
  BELOW_THICKNESS_LIMIT, DIAMETER_LIMIT, THICKNESS_LIMIT
} from 'src/constant/keypress/constant';
import { KeypressService } from './keypress.service';

describe('KeypressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    expect(service).toBeTruthy();
  });

  it('numberOnly should only accept numbers', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Keyz = new KeyboardEvent('keypress', { key: 'Z' });
    const KeyM = new KeyboardEvent('keypress', { key: '-' });
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.isNumber(Keyz)).toBe(false);
    expect(service.isNumber(KeyM)).toBe(false);
    expect(service.isNumber(Key1)).toBe(true);
  });

  it('rangeValidator should only accept value undex or equal to max', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.rangeValidator(Key1, 1, 11)).toBe(true);
    // expect(service.rangeValidator(Key1, 1, 10)).toBe(true);
    // expect(service.rangeValidator(Key1, 1, 10)).toBe(false);
  });

  it('thicknessValidator should only accept thickness below 99', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.thicknessValidator(Key1, BELOW_THICKNESS_LIMIT)).toBe(true);
    expect(service.thicknessValidator(Key1, THICKNESS_LIMIT)).toBe(false);
  });

  it('rotationValidator should only accept rotation below 999', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.rotationValidator(Key1, BELOW_ROTATION_LIMIT)).toBe(true);
    expect(service.rotationValidator(Key1, ABOVE_ROTATION_LIMIT)).toBe(false);
  });

  it('angleValidator should only accept rotation below 360', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.angleValidator(Key1, BELOW_ANGLE_LIMIT)).toBe(true);
    expect(service.angleValidator(Key1, ABOVE_ANGLE_LIMIT)).toBe(false);
  });

  it('lengthValidator should only accept rotation below 100', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.lengthValidator(Key1, BELOW_LENGTH_LIMIT)).toBe(true);
    expect(service.lengthValidator(Key1, ABOVE_LENGTH_LIMIT)).toBe(false);
  });

  it('diameterValidator should only accept diametre below 99', () => {
    const service: KeypressService = TestBed.get(KeypressService);
    const Key1 = new KeyboardEvent('keypress', { key: '1' });
    expect(service.diameterValidator(Key1, BELOW_DIAMETER_LIMIT)).toBe(true);
    expect(service.diameterValidator(Key1, DIAMETER_LIMIT)).toBe(false);
  });

});
