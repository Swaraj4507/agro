import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// import { Loader } from "../../components";
// import { useGlobalContext } from "../../context/GlobalProvider";

const AuthLayout = () => {
  // const { loading, isLogged } = useGlobalContext();

  // if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in-b"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-in-f"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
          name="sign-up-b"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up-f"
          options={{
            headerShown: false,
          }}
        /> */}
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgotPassword"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      {/* <Loader isLoading={loading} /> */}
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AuthLayout;
