import { TestBed } from '@angular/core/testing';
import { AchievementsHandlerService } from './achievements-handler.service';

describe('AchievementsHandlerService', () => {
    let service: AchievementsHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AchievementsHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
