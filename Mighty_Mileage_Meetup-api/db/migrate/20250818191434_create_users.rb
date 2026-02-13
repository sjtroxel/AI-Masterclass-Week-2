class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :first_name, limit: 30, null: false
      t.string :last_name, limit: 30, null: false
      t.string :email, limit: 255, null: false
      t.string :username, limit: 30, null: false
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :username, unique: true
  end
end