import styles from "./Dropdown.module.scss";


function Dropdown() {
  return (
    <div className={styles.wrapperDrop}>
        <div className="flex border flex-col items-center justify-center">
         <h1>Este es mi Dropdown</h1>
         <p>Hola, como estas?</p>
        </div>
    </div>
  );
}

export default Dropdown
