import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  createUserWithEmailAndPassword,
  getIdToken,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { UserDto } from '../dtos/User.dto';
import { UserCredentialsDto } from '../dtos/UserCredentialsDto';

@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}

  public async login(
    email: string,
    password: string
  ): Promise<UserCredentialsDto> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password
      );

      if (userCredential) {
        const id: string = userCredential.user.uid;
        const docRef: DocumentReference = doc(
          this.firebaseService.usersCollection,
          id
        );
        const snapshot: DocumentSnapshot = await getDoc(docRef);
        const data: UserDto = {
          ...snapshot.data(),
          id: snapshot.id,
        } as UserDto;
        delete data.password;
        const jwt = await getIdToken(userCredential.user);

        return { user: data, jwt };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Zły login lub hasło.',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async authByJWT({ token }): Promise<UserDto> {
    try {
      const userCredential =
        await this.firebaseService.verifyAuth.verifyIdToken(token);

      if (userCredential) {
        const id: string = userCredential.uid;
        const docRef: DocumentReference = doc(
          this.firebaseService.usersCollection,
          id
        );
        const snapshot: DocumentSnapshot = await getDoc(docRef);
        const data: UserDto = {
          ...snapshot.data(),
          id: snapshot.id,
        } as UserDto;
        delete data.password;

        return data;
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN
      );
    }
  }

  public async register(body: Omit<UserDto, 'id'>): Promise<void> {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.firebaseService.auth,
          body.email,
          body.password
        );

      if (userCredential) {
        const id: string = userCredential.user.uid;
        const docRef: DocumentReference = doc(
          this.firebaseService.usersCollection,
          id
        );
        await setDoc(docRef, body);
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Nie udało się utworzyć konta dla podanego adresu e-mail.',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
