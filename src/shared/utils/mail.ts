import axios from "axios";
export const httpEmailSender = async (
  subject: string,
  html: any,
  email: string,
): Promise<any> => {
  try {
    const response = await axios.post(
      `https://myecurrency-email-service-8b8d1312b609.herokuapp.com/send-email`,
      {
        subject,
        html,
        recipient: email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(response.data);
  } catch (error) {
    console.error('❌ Email sending failed:');
  }
};
