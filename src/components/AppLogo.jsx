export default function AppLogo(){
    return (
        <div className="text-center my-3">
            <img
                src={`${import.meta.env.BASE_URL}CommitHub.png`}
                alt="CommitHub"
                className="img-fluid"
                style={{
                    transition: "all 0.3s ease",
                }}
            />
        </div>
    )
}