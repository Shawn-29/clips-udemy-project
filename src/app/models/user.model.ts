export default interface IUser {
    email: string,
    password?: string,
    age: number,
    name: string,
    phoneNumber: string
};

/* class version */
// export default class IUser {
//     email?: string;
//     password?: string;
//     age?: number;
//     name?: string;
//     phoneNumber?: string;
// };