import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {TextInput, View, StyleSheet, Platform, Alert} from 'react-native';
import {useDispatch} from 'react-redux';
import {otpScreen} from '../../Store/Reducers/ScreenReducer';
import {postRequest} from '../../App/fetch';
import {BASE_URL} from '../../App/api';
import {
  getDataFromAsync,
  setDataToAsync,
} from '../../Utils/getAndSetAsyncStorage';
import {userDataFromAsyncStorage} from '../../Store/Reducers/AuthReducer';
import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import app from '../../Firebase/firebaseConfig';
import Toast from 'react-native-toast-message';

export const OtpInput = props => {
  const inputRefs = useRef([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  console.log('p', props);
  const [isAllFieldsFilled, setIsAllFieldsFilled] = useState(false);
  const dispatch = useDispatch();
  const Navigation = useNavigation();

  // const otpValue = useRef('');

  console.log('Length is: ', props.otpValue.current.length);
  useEffect(() => {
    if (isAllFieldsFilled && props.otpValue.current.length === 6) {
      console.log('Length is: ', props.otpValue.current);
      console.log('Length is: ', props.otpValue.current.length);

      //OTP Start checking

      var formdata = new FormData();
      formdata.append('email', props.email);
      formdata.append('otp', props.otpValue.current);

      console.log('formdata:', formdata);
      // setLoading(true);
      // props.setOtpVerificationLoading(true); // Set loading state in OtpScreen
      postRequest(`${BASE_URL}/users/registration/verify-otp/`, formdata)
        .then(result => {
          console.log(result.success);
          console.log('otp result', result);
          // setLoading(false);
          if (result.success) {
            Alert.alert('Verified', result.message);
            // Toast.show({
            //   type: 'success',
            //   text1: 'Verified',
            //   text2: result.message,
            //   visibilityTime: 5000,
            //   position: 'top',
            //   autoHide: true,
            //   bottomOffset: 50,
            // });
            if (props.screenName == 'TermofServices') {
              var formdata = new FormData();
              formdata.append('username', props.email);
              formdata.append('password', props.password);

              // setLoading(true);
              postRequest(`${BASE_URL}/users/login/token/`, formdata)
                .then(result => {
                  // setLoading(false);
                  if (result?.non_field_errors) {
                    console.log('Not found');
                    // Alert.alert('', result?.non_field_errors[0]);
                    Toast.show({
                      type: 'success',
                      text1: '',
                      text2: result?.non_field_errors[0],
                      visibilityTime: 3000,
                      position: 'top',
                      autoHide: true,
                      bottomOffset: 50,
                    });
                    // props.setOtpVerificationLoading(false);
                  } else {
                    console.log('resultsh', result);
                    const {
                      token,
                      user: {
                        email,
                        id,
                        is_active,
                        profile: {display_name},
                      },
                    } = result;

                    // Create a new object with the extracted fields
                    const extractedData = {
                      token,
                      email,
                      display_name,
                      id,
                      is_active,
                    };
                    console.log('extractedData', extractedData);

                    app
                      .database()
                      .ref(`users/${extractedData.id}`)
                      .set(extractedData)
                      .then(() => {
                        console.log('User Data saved.')
                        dispatch(otpScreen(true));
                        setDataToAsync('token', JSON.stringify(result.token));
                        setDataToAsync('user', JSON.stringify(result));
                        getDataFromAsync('user')
                          .then(res => {
                            dispatch(userDataFromAsyncStorage(JSON.parse(res)));
                            // props.setOtpVerificationLoading(false); // Reset loading state in OtpScreen
                          })
                          .catch(err => {
                            console.log(
                              'Error From getting from local storage: ',
                              err,
                            );
                            // props.setOtpVerificationLoading(false); // Reset loading state in OtpScreen

                          });
                      })
                      .catch(() => {
                        console.log('User Data not saved.')
                        // Alert.alert('Error', 'Something went wrong please try again'); 
                        Toast.show({
                          type: 'error',
                          text1: 'Error',
                          text2: 'Something went wrong please try again',
                          visibilityTime: 3000,
                          position: 'top',
                          autoHide: true,
                          bottomOffset: 50,
                        });
                        // props.setOtpVerificationLoading(false);
                      });

                    // dispatch(otpScreen(true));
                    // setDataToAsync('token', JSON.stringify(result.token));
                    // setDataToAsync('user', JSON.stringify(result));
                    // app
                    //   .database()
                    //   .ref(`users/${extractedData.token}`)
                    //   .set(extractedData)
                    //   .then(() => console.log('User Data saved.'))
                    //   .catch(() => console.log('User Data not saved.'));

                    // Navigation.navigate('ProfileCreateStart');
                    // getDataFromAsync('user')
                    //   .then(res => {
                    //     dispatch(userDataFromAsyncStorage(JSON.parse(res)));
                    //   })
                    //   .catch(err => {
                    //     console.log(
                    //       'Error From getting from local storage: ',
                    //       err,
                    //     );
                    //   });
                  }
                })
                .catch(error => {
                  console.log('error', error);
                  // setLoading(false);
                  // props.setOtpVerificationLoading(false); // Reset loading state in OtpScreen
                });
            } else {
              console.log('token', result.token);
              Navigation.navigate('ChangeForgetPassword', result.token);
              // props.setOtpVerificationLoading(false); // Reset loading state in OtpScreen
            }
          } else {
            setIsAllFieldsFilled(false);
            // Alert.alert('Error', result.message);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: result.message,
              visibilityTime: 3000,
              position: 'top',
              autoHide: true,
              topOffset: 55,
            });
            // props.setOtpVerificationLoading(false); // Reset loading state in OtpScreen
          }
          // setLoading(false);
        })
        .catch(error => {
          // setLoading(false);
          console.log('error', error);
          // props.setOtpVerificationLoading(false); // Reset loading state in OtpScreen
        });
      //OTP End checking
    }
  }, [isAllFieldsFilled, navigation]);

  const handleKeyPress = (e, index) => {
    const value = e.nativeEvent.key;
    const isDigit = /^\d+$/.test(value);

    if (e.nativeEvent.key === 'Backspace') {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
        // Update the OTP value length
        props.otpValue.current = props.otpValue.current.slice(0, -1);
      } else {
        // OTP value is already empty or at the beginning; do nothing
        console.log('aaaaaaa');
      }
    } else if (index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (isDigit) {
      const newOtpValue =
        props.otpValue.current.substr(0, index) +
        value +
        props.otpValue.current.substr(index + 1);
      props.otpValue.current = newOtpValue;
      inputRefs.current[index].setNativeProps({text: value});
      const isAllFieldsFilled = inputRefs.current.every(
        inputRef => props.otpValue.current.length === 6,
      );
      setIsAllFieldsFilled(isAllFieldsFilled);
    }
  };

  const handleOTPChange = text => {
    props.otpValue.current = text;
    const digits = text.split('');
    digits.forEach((digit, index) => {
      inputRefs.current[index].setNativeProps({text: digit});
    });
  };

  return (
    <View style={styles.container}>
      {[...Array(6)].map((_, index) => (
        <TextInput
          key={index.toString()}
          ref={ref => (inputRefs.current[index] = ref)}
          style={styles.input}
          keyboardType="numeric"
          maxLength={1}
          onKeyPress={e => handleKeyPress(e, index)}
        />
      ))}
      <TextInput
        style={{position: 'absolute', width: 0, height: 0, opacity: 0}}
        value={props.otpValue.current}
        onChangeText={handleOTPChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: 50,
    height: 54,
    borderBottomWidth: Platform.OS === 'ios' ? 0.4 : 1,
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 4,
    borderBottomColor: 'rgba(77, 77, 77, 1)',
    color: 'rgba(28, 28, 28, 1)',
  },
});