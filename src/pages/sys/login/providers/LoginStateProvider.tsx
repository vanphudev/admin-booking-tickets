import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';

export enum LoginStateEnum {
   LOGIN,
   QR_CODE,
   REGISTER,
}

interface LoginStateContextType {
   loginState: LoginStateEnum;
   setLoginState: (loginState: LoginStateEnum) => void;
   backToLogin: () => void;
}
const LoginStateContext = createContext<LoginStateContextType>({
   loginState: LoginStateEnum.LOGIN,
   setLoginState: () => {},
   backToLogin: () => {},
});

export function useLoginStateContext() {
   const context = useContext(LoginStateContext);
   return context;
}

export function LoginStateProvider({ children }: PropsWithChildren) {
   const [loginState, setLoginState] = useState(LoginStateEnum.LOGIN);

   function backToLogin() {
      setLoginState(LoginStateEnum.LOGIN);
   }

   const value: LoginStateContextType = useMemo(() => ({ loginState, setLoginState, backToLogin }), [loginState]);
   return <LoginStateContext.Provider value={value}>{children}</LoginStateContext.Provider>;
}
