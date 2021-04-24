import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import TextEditor from "./components/TextEditor";
import Footer from "./components/Footer";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const documentId = uuidv4();
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to={`/document/${documentId}`} />
        </Route>
        <Route exact path="/document/:id">
          <>
            <ToastContainer />
            <TextEditor />
            <Footer />
          </>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
