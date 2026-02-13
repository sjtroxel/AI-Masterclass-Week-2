# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_06_164341) do
  create_table "comments", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "meetup_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "commentable_type", null: false
    t.integer "commentable_id", null: false
    t.index ["commentable_type", "commentable_id"], name: "index_comments_on_commentable"
    t.index ["meetup_id"], name: "index_comments_on_meetup_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "locations", force: :cascade do |t|
    t.string "locationable_type", null: false
    t.integer "locationable_id", null: false
    t.string "zip_code"
    t.string "city"
    t.string "state"
    t.string "country"
    t.string "address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["locationable_type", "locationable_id"], name: "index_locations_on_locationable"
  end

  create_table "meetup_participants", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "meetup_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["meetup_id"], name: "index_meetup_participants_on_meetup_id"
    t.index ["user_id"], name: "index_meetup_participants_on_user_id"
  end

  create_table "meetups", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "activity"
    t.text "content"
    t.datetime "start_date_time"
    t.datetime "end_date_time"
    t.integer "guests"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.index ["user_id"], name: "index_meetups_on_user_id"
  end

  create_table "profiles", force: :cascade do |t|
    t.integer "user_id", null: false
    t.text "bio"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name", limit: 30, null: false
    t.string "last_name", limit: 30, null: false
    t.string "email", limit: 255, null: false
    t.string "username", limit: 30, null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "comments", "meetups"
  add_foreign_key "comments", "users"
  add_foreign_key "meetup_participants", "meetups"
  add_foreign_key "meetup_participants", "users"
  add_foreign_key "meetups", "users"
  add_foreign_key "profiles", "users"
end
