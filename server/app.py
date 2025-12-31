# server/app.py
from flask import Flask, request, jsonify, make_response
from flask_migrate import Migrate # type: ignore
from models import Customer, db
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
migrate = Migrate(app, db)
db.init_app(app)

@app.route("/customers", methods=['GET', 'POST'])
def customers():
    if request.method == 'GET':
        return make_response(jsonify([c.to_dict() for c in Customer.query.all()]), 200)
    
    if request.method == 'POST':
        data = request.get_json()
        try:
            new_cust = Customer(name=data.get('name'), email=data.get('email'), age=data.get('age'))
            db.session.add(new_cust)
            db.session.commit()
            return make_response(jsonify(new_cust.to_dict()), 201)
        except IntegrityError:
            db.session.rollback()
            return make_response(jsonify({"message": "Email must be unique"}), 422)

@app.route("/customers/<int:id>", methods=['PATCH', 'DELETE'])
def customer_by_id(id):
    customer = Customer.query.get(id)
    if not customer:
        return make_response(jsonify({"error": "Not found"}), 404)

    if request.method == 'PATCH':
        data = request.get_json()
        try:
            for attr in data:
                setattr(customer, attr, data.get(attr))
            db.session.commit()
            return make_response(jsonify(customer.to_dict()), 200)
        except IntegrityError:
            db.session.rollback()
            return make_response(jsonify({"message": "Email already in use"}), 422)

    if request.method == 'DELETE':
        db.session.delete(customer)
        db.session.commit()
        return make_response(jsonify({}), 204)

if __name__ == "__main__":
    app.run(port=5555, debug=True)
