export default function AppLogo(){
    return (
        <div className="text-center my-3" >
            <img 
                src={`${import.meta.env.BASE_URL}CommitHub 1-1.png`}
                alt="CommitHub"
                className="img-fluid"
                style={{
                    scale:"0.8",
                    transition: "all 0.3s ease",
                }}
            />
        </div>
    )
}