// Constants shared by background, content and page scripts
const GET_URL = "http://www.brymck.com/reasonable/get";
const GIVE_URL = "http://www.brymck.com/reasonable/give"
const STEVE_SMITH_GET_URL = "http://www.brymck.com/reasonable/get?what=STEVE_SMITH";
const STEVE_SMITH_GIVE_URL = "http://www.brymck.com/reasonable/give"; // POST what=STEVE_SMITH

const QUICKLOAD_MAX_ITEMS = 20;

var actions = {
  black: { label: "hide", value: "black" },
  white: { label: "show", value: "white" },
  auto:  { label: "auto", value: "auto"  }
};
