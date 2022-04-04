import { Injectable } from '@angular/core';
import { AVATARS_LIST } from 'src/app/models/constant/pictures/constant';

@Injectable({
    providedIn: 'root'
})
export class AvatarService {

    getAvatarUrlString(index: number) : string {
        index = index < 12 ? index : 0;
        return AVATARS_LIST[index];
    }
}
