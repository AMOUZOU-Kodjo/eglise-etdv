const Title = ({ title, subtitle }) => {
  return (
    <div className="text-center">
      <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-accent mb-4 leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base-content/60 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Title;
