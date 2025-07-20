import { StarIcon } from '@heroicons/react/20/solid';

const CafeCard = ({ cafe }) => {
  const dishes = cafe.recommended_dishes.split(',').map(dish => dish.trim());
  
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{cafe.name}</h3>
        
        <div className="flex items-center mb-3">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <span className="ml-1 text-gray-700">{cafe.rating}</span>
        </div>
        
        <p className="text-gray-600 italic mb-4">{cafe.address}</p>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommended Dishes</h4>
          {dishes[0] !== "No specific dishes mentioned" && dishes[0] !== "Error analyzing reviews" ? (
            <div className="flex flex-wrap gap-2">
              {dishes.map((dish, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {dish}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">{cafe.recommended_dishes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
