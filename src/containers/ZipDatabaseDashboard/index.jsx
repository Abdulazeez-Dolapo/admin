import React from "react";
import { connect } from "react-redux";
import { Form, Input, Button } from "antd";

import zipcodeStateBranch from "../../state/zipcodes";

const ZipLookupForm = Form.create({
  name: "global_state",
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    return {
      zipcode: Form.createFormField({
        ...props.zipcode,
        value: props.zipcode.value,
      }),
      lat: Form.createFormField({
        ...props.zipcode,
        value: props.lat.value,
      }),
      lng: Form.createFormField({
        ...props.zipcode,
        value: props.lng.value,
      }),
    };
  },
//   onValuesChange(_, values) {
//     console.log(values);
//   },
})((props) => {
    const { lookupZipcode, submitZipcode, isInDatabase} = props;
    const { getFieldDecorator, getFieldError, getFieldValue } = props.form;
    const handleSubmit = (e) => {
      e.preventDefault();
      props.form.validateFields((err, values) => {
        if (!err) {
          if (!values.lat && !values.lng) {
              return lookupZipcode(values.zipcode)
          }
          if (values.zipcode && values.lat && values.lng) {

              submitZipcode(values);
          }
        } else {
            console.log(err)
        }
      });
    };
    let feedback;
    if (isInDatabase === true) {
        feedback = `${getFieldValue("zipcode")} is in the database`
    } else if (isInDatabase === false) {
        feedback = `${getFieldValue("zipcode")} is missing from the database, add lat and lng values`
    }
  return (
    <Form layout="inline" onSubmit={handleSubmit}>
      <Form.Item label="Zipcode">
        {getFieldDecorator("zipcode", {
          validateTrigger: "onBlur",
          rules: [
            {
              required: true,
              message: "must be 5 digits",
              pattern: /\d{5}/g,
            },
          ],
        })(<Input />)}
      </Form.Item>
    {feedback && (<div>{feedback}</div>)}
      {!isInDatabase && (
        <Form.Item
          hasFeedback={props.lat.touched}
          label="Latitude"
          validateStatus={
            props.lat.errors && props.lat.touched ? "error" : "success"
          }
          help={props.lat.errors ? props.lat.errors[0].message : ""}
        >
          {getFieldDecorator("lat", {
            validateTrigger: "onBlur",
            rules: [
              {
                required: true,
                message: "must be between 19 and 65",
                validator: (rule, value, cb) =>
                  Number(value) > 19 && Number(value) < 65 ? cb() : cb(rule),
              },
            ],
          })(<Input />)}
        </Form.Item>
      )}
      {!isInDatabase && (
        <Form.Item
          hasFeedback={props.lng.touched}
          label="Longitude"
          validateStatus={props.lng.errors && props.lng.touched? "error" : "success"}
          help={props.lng.errors ? props.lng.errors[0].message : ""}
        >
          {getFieldDecorator("lng", {
            validateTrigger: "onBlur",
            rules: [
              {
                required: true,
                message: "must be a negative number between -162 and -68",
                validator: (rule, value, cb) =>
                  Number(value) >= -162 && Number(value) <= -68
                    ? cb()
                    : cb(rule),
              },
            ],
          })(<Input />)}
        </Form.Item>
      )}
      <Button type="primary" htmlType="submit" >
        {!isInDatabase ? "Save" : "Lookup"}
      </Button>
    </Form>
  );
});


class ZipLookup extends React.Component {
  state = {
    fields: {
      zipcode: {
        value: "",
      },
      lat: {
        value: "",
      },
      lng: {
        value: "",
      },
    },
  };

  handleLookupZipcode = (zipcode) => {
    this.props.lookupZipcode(zipcode);
  };

  handleSubmitZipcode = (values) => {
    this.props.saveZipcode(values)
  };

  handleFormChange = (changedFields) => {
    if (changedFields.zipcode) {
        this.props.setFoundZipcode("init");
    }
    this.setState(({ fields }) => ({
      fields: { ...fields, ...changedFields },
    }));
  };

  render() {
    const { fields } = this.state;
    const { isInDatabase } = this.props;
    return (
      <div>
        <ZipLookupForm
          {...fields}
          isInDatabase={isInDatabase}
          onChange={this.handleFormChange}
          lookupZipcode={this.handleLookupZipcode}
          submitZipcode={this.handleSubmitZipcode}
        />
        {/* <pre className="language-bash">{JSON.stringify(fields, null, 2)}</pre> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isInDatabase: zipcodeStateBranch.selectors.getIsInDatabase(state),
});

const mapDispatchToProps = {
  lookupZipcode: zipcodeStateBranch.actions.lookUpZipcode,
  saveZipcode: zipcodeStateBranch.actions.submitZipcode,
  setFoundZipcode: zipcodeStateBranch.actions.setFoundZipcode,
};

export default connect(mapStateToProps, mapDispatchToProps)(ZipLookup);
