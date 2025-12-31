// client/src/components/Signup.js
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

export const SignupForm = () => {
  const [customers, setCustomers] = useState([]);
  const [refreshPage, setRefreshPage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, [refreshPage]);

  const formSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Must enter email"),
    name: yup.string().required("Must enter a name").max(15),
    age: yup.number().positive().integer().required("Must enter age").typeError("Enter a number").max(125),
  });

  const handleDelete = (id) => {
    if (window.confirm("Delete this customer?")) {
      fetch(`/customers/${id}`, { method: "DELETE" }).then((res) => {
        if (res.ok) setRefreshPage(!refreshPage);
      });
    }
  };

  return (
    <div className="container">
      <h1>Customer Management</h1>

      {showSuccess && (
        <div className="success-message">
          ✅ {editingId ? "Customer Updated!" : "Customer Added!"}
        </div>
      )}

      <Formik
        initialValues={{ name: "", email: "", age: "" }}
        validationSchema={formSchema}
        enableReinitialize={true} 
        onSubmit={(values, { setErrors, setSubmitting, resetForm }) => {
          const url = editingId ? `/customers/${editingId}` : "/customers";
          const method = editingId ? "PATCH" : "POST";

          fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          }).then((res) => {
            setSubmitting(false);
            if (res.ok) {
              resetForm();
              setEditingId(null);
              setRefreshPage(!refreshPage);
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 3000);
            } else {
              res.json().then((err) => {
                if (err.message && err.message.toLowerCase().includes("email")) {
                  setErrors({ email: "Email is already taken." });
                }
              });
            }
          });
        }}
      >
        {({ isSubmitting, errors, touched, setValues, resetForm }) => (
          <>
            <Form className="signup-form">
              <label>Email Address</label>
              <Field name="email" className={touched.email && errors.email ? "input-error" : ""} />
              <ErrorMessage name="email" component="p" className="error-text" />

              <label>Name</label>
              <Field name="name" className={touched.name && errors.name ? "input-error" : ""} />
              <ErrorMessage name="name" component="p" className="error-text" />

              <label>Age</label>
              <Field name="age" className={touched.age && errors.age ? "input-error" : ""} />
              <ErrorMessage name="age" component="p" className="error-text" />

              <div className="button-group">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner"></span> : null}
                  {editingId ? "Update Customer" : "Add Customer"}
                </button>
                
                {editingId && (
                  <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); resetForm(); }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </Form>

            <table style={{ marginTop: "40px" }}>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Age</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td><td>{c.email}</td><td>{c.age}</td>
                    <td>
                      <button className="edit-btn" onClick={() => { setEditingId(c.id); setValues(c); }}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Formik>
    </div>
  );
};
