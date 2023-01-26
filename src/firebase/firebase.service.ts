import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import {
  collection,
  CollectionReference,
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import { Config } from '../dtos/Config.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  public app: FirebaseApp;
  public auth: Auth;
  public firestore: Firestore;
  public usersCollection: CollectionReference;

  public verifyApp: admin.app.App;
  public verifyAuth: admin.auth.Auth;

  constructor(private configService: ConfigService<Config>) {
    this.app = initializeApp(
      {
        apiKey: configService.get<string>('apiKey'),
        appId: configService.get<string>('appId'),
        authDomain: configService.get<string>('authDomain'),
        measurementId: configService.get<string>('measurementId'),
        projectId: configService.get<string>('projectId'),
        storageBucket: configService.get<string>('storageBucket'),
        messagingSenderId: configService.get<string>('messagingSenderId'),
      },
      Math.random() + 100 + ''
    );

    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    this._createCollections();

    this.verifyApp = admin.initializeApp(
      {
        credential: admin.credential.cert({
          privateKey: configService.get<string>('private_key'),
          clientEmail: configService.get<string>('client_email'),
          projectId: configService.get<string>('project_id'),
        } as Partial<admin.ServiceAccount>),
      },
      Math.random() + 100 + ''
    );

    this.verifyAuth = admin.auth(this.verifyApp);
  }

  private _createCollections() {
    this.usersCollection = collection(this.firestore, 'users');
  }
}
