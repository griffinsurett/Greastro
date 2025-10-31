// src/components/forms/examples/ContactForm.tsx
import { z } from "zod";
import Form from "@/components/Form/Form";
import Input from "@/components/Form/inputs/Input";
import Textarea from "@/components/Form/inputs/Textarea";
import FormMessages from "@/components/Form/FormMessages";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactForm() {
  const handleSubmit = async (values: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", values);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validationSchema={contactSchema}
      successMessage="Thank you! We'll get back to you soon."
      resetOnSuccess={true}
      className="w-full"
    >
      <FormMessages />

      <Input
        name="name"
        label="Name"
        type="text"
        required
        placeholder="John Doe"
      />

      <Input
        name="email"
        label="Email"
        type="email"
        required
        placeholder="john@example.com"
      />

      <Textarea
        name="message"
        label="Message"
        required
        placeholder="Tell us what you need..."
      />

      <button
        type="submit"
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Send Message
      </button>
    </Form>
  );
}
