import { BrowserModule } from '@angular/platform-browser';
import {MatTooltipModule} from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatTableModule } from '@angular/material/table';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ChartsModule } from 'ng2-charts';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/authentification/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { GamemodeComponent } from './components/menu/gamemode/gamemode.component';
import { ProfileComponent } from './components/menu/profile/profile.component';
import { LeaderboardComponent } from './components/menu/leaderboard/leaderboard.component';
import { ChatComponent } from './components/chat/chat.component';
import { CreateAccountComponent } from './components/authentification/create-account/create-account.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { WordImagePairComponent } from './components/menu/word-image-pair/word-image-pair.component';
import { HintListComponent } from './components/menu/word-image-pair/hint-list/hint-list.component';
import { WordImagePairDrawingCreationComponent } from './components/menu/word-image-pair/word-image-pair-drawing-creation/word-image-pair-drawing-creation.component';
import { DrawingToolBoxComponent } from './components/drawing-tool-box/drawing-tool-box.component';
import { WordImagePairPreviewComponent } from './components/menu/word-image-pair/word-image-pair-preview/word-image-pair-preview.component';
import { WordImagePairParametersComponent } from './components/menu/word-image-pair/word-image-pair-parameters/word-image-pair-parameters.component';
import { ChatMessageComponent } from './components/chat/chat-message/chat-message.component';
import { ChatMessageListComponent } from './components/chat/chat-message-list/chat-message-list.component';
import { ChatNavComponent } from './components/chat/chat-nav/chat-nav.component';
import { ChatJoinedRoomComponent } from './components/chat/chat-joined-room/chat-joined-room.component';
import { ChatRoomComponent } from './components/chat/chat-room/chat-room.component';
import { DrawingSurfaceComponent } from './components/drawing-surface/drawing-surface.component';
import { JoinCreateGameComponent } from './components/menu/join-create-game/join-create-game.component';
import { GameViewComponent } from './components/menu/gamemode/game-view/game-view.component';
import { LeaveRoomComponent } from './components/warning/leave-room/leave-room.component';
import { PortalModule } from '@angular/cdk/portal';
import { CustomButtonComponent } from './components/common/custom-button/custom-button.component';
import { PreviewComponent } from './components/drawing-surface/preview/preview/preview.component';
import { ServerErrorComponent } from './components/warning/server-error/server-error.component';
import { LobbyListComponent } from './components/menu/gamemode/game-creation/lobby-list/lobby-list.component';
import { GameCreationComponent } from './components/menu/gamemode/game-creation/game-creation.component';
import { LobbyComponent } from './components/menu/gamemode/lobby/lobby.component';
import { LobbyCreationComponent } from './components/menu/gamemode/game-creation/lobby-creation/lobby-creation.component';
import { LogoutComponent } from './components/warning/logout/logout.component';
import { LeaveLobbyComponent } from './components/warning/leave-lobby/leave-lobby.component';
import { InfoBarComponent } from './components/menu/gamemode/game-view/info-bar/info-bar.component';
import { LeaveGameComponent } from './components/warning/leave-game/leave-game.component';
import { GameScoreboardComponent } from './components/menu/gamemode/game-view/game-scoreboard/game-scoreboard.component';
import { EndRoundDialogComponent } from './components/menu/gamemode/game-view/end-round-dialog/end-round-dialog.component';
import { StartGameDialogComponent } from './components/menu/gamemode/start-game-dialog/start-game-dialog.component';
import { EndGameDialogComponent } from './components/menu/gamemode/game-view/end-game-dialog/end-game-dialog.component';
import { SERVER_LINK } from './models/constant/drawing/constant';
import { EditComponent } from './components/menu/profile/edit/edit.component';
import { UserProfileComponent } from './components/menu/profile/user-profile/user-profile.component';
import { CredentialComponent } from './components/authentification/forgot-password/credential/credential.component';
import { NewPasswordComponent } from './components/authentification/forgot-password/new-password/new-password.component';
import { LeaveNewPasswordComponent } from './components/warning/leave-new-password/leave-new-password.component';
import { AchievementsComponent } from './components/menu/achievements/achievements.component';
import { TutorielComponent } from './components/tutoriel/tutoriel.component';
import { LoadingComponent } from './components/warning/loading/loading.component';
import { LoginTutoComponent } from './components/tutoriel/login-tuto/login-tuto.component';
import { CreateAccountTutoComponent } from './components/tutoriel/create-account-tuto/create-account-tuto.component';
import { TimerComponent } from './components/menu/gamemode/game-view/info-bar/timer/timer.component';
import { GeneralStatsComponent } from './components/menu/profile/general-stats/general-stats.component';
import { MatchHistoryComponent } from './components/menu/profile/match-history/match-history.component';
import { ConnectionStatsComponent } from './components/menu/profile/connection-stats/connection-stats.component';
import { LeaveWIPComponent } from './components/warning/leave-wip/leave-wip.component';

const config: SocketIoConfig = { url: SERVER_LINK, options: {} };

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MenuComponent,
        GamemodeComponent,
        ProfileComponent,
        LeaderboardComponent,
        ChatComponent,
        CreateAccountComponent,
        WordImagePairComponent,
        HintListComponent,
        WordImagePairDrawingCreationComponent,
        DrawingToolBoxComponent,
        WordImagePairPreviewComponent,
        WordImagePairParametersComponent,
        ChatMessageComponent,
        ChatMessageListComponent,
        ChatNavComponent,
        ChatJoinedRoomComponent,
        ChatRoomComponent,
        DrawingSurfaceComponent,
        JoinCreateGameComponent,
        GameViewComponent,
        LeaveRoomComponent,
        CustomButtonComponent,
        PreviewComponent,
        ServerErrorComponent,
        LobbyListComponent,
        GameCreationComponent,
        LobbyComponent,
        LobbyCreationComponent,
        LogoutComponent,
        LeaveLobbyComponent,
        InfoBarComponent,
        LeaveGameComponent,
        GameScoreboardComponent,
        EndRoundDialogComponent,
        StartGameDialogComponent,
        EndGameDialogComponent,
        EditComponent,
        UserProfileComponent,
        CredentialComponent,
        NewPasswordComponent,
        LeaveNewPasswordComponent,
        AchievementsComponent,
        TutorielComponent,
        LoadingComponent,
        LoginTutoComponent,
        CreateAccountTutoComponent,
        TimerComponent,
        GeneralStatsComponent,
        MatchHistoryComponent,
        ConnectionStatsComponent,
        LeaveWIPComponent,
    ],
    imports: [
        MatProgressSpinnerModule,
        MatTableModule,
        MatBadgeModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatSliderModule,
        MatButtonModule,
        MatInputModule,
        MatProgressBarModule,
        MatGridListModule,
        MatDialogModule,
        MatListModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatRippleModule,
        MatButtonToggleModule,
        MatIconModule,
        MatExpansionModule,
        MatSelectModule,
        FormsModule,
        MatCardModule,
        ReactiveFormsModule,
        ChartsModule,
        HttpClientModule,
        PortalModule,
        BrowserModule,
        MatRadioModule,
        ColorSketchModule,
        BrowserModule,
        ColorPickerModule,
        SocketIoModule.forRoot(config),
    ],
    providers: [{ provide: MatDialogRef, useValue: { open: () => true } }],
    bootstrap: [AppComponent],
})
export class AppModule {}
