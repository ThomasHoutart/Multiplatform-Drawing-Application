import { TestBed } from '@angular/core/testing';

import { WordImagePairHandler } from './word-image-pair-handler.service';

describe('WordPairImageHandlerService', () => {
    let service: WordImagePairHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WordImagePairHandler);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
