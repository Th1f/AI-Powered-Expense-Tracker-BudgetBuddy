import { UserData, Transaction } from "../types";
import {auth} from "./firebase";
const BACKEND_URL ="http://127.0.0.1:5000";

export const testAuth = async () => {
  try {
    const user = await auth.currentUser;
    console.log("IT works")
    console.log(user);
  } catch (error) {
    console.log(error);
  }
}

export const createUser = async (username: String) =>{
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User is not authenticated');
    }
    if (!username) {
      throw new Error('Username is required');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: username
      }),
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const fetchUserData = async ():Promise<UserData | null>=> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User is not authenticated');
    }
    console.log(user);

    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return null
  }
}

export const addExpense = async (expense: Transaction ) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User is not authenticated');
    }
    console.log(user);

    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/api/auth/addexpenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}