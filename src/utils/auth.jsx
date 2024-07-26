import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

export const handleSignUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Handle successful signup (e.g., navigate to a different page)
        return userCredential;
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
};

// export const handleSignIn = async (email, password) => {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     await userCredential.user.getIdToken(true); // Force refresh to get custom claims
//     return userCredential.user;
//   };

export const handleSignIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential; // Return the user credential to indicate success
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
};

export const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  

export const handleSendVerificationEmail = async (user) => {
    // const user = auth.currentUser;
    if (user) {
        await sendEmailVerification(user);
        // Inform user that verification email has been sent
    }
};

export const handleSendPasswordResetEmail = async (email) => {
    await sendPasswordResetEmail(auth, email);
    // Inform user that password reset email has been sent
};
